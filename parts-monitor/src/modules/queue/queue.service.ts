import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue, Job } from 'bull';
import { MonitoringJob } from '../product/entities/monitoring-job.entity';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('scraping') private readonly scrapingQueue: Queue,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async getScrapingQueues() {
    const waiting = await this.scrapingQueue.getWaiting();
    const active = await this.scrapingQueue.getActive();
    const completed = await this.scrapingQueue.getCompleted();
    const failed = await this.scrapingQueue.getFailed();

    return {
      queue: 'scraping',
      stats: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
      jobs: {
        waiting: this.sanitizeJobs(waiting),
        active: this.sanitizeJobs(active),
        completed: this.sanitizeJobs(completed.slice(-10)),
        failed: this.sanitizeJobs(failed.slice(-10)),
      },
    };
  }

  async getNotificationQueues() {
    const waiting = await this.notificationQueue.getWaiting();
    const active = await this.notificationQueue.getActive();
    const completed = await this.notificationQueue.getCompleted();
    const failed = await this.notificationQueue.getFailed();

    return {
      queue: 'notification',
      stats: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
      jobs: {
        waiting: this.sanitizeJobs(waiting),
        active: this.sanitizeJobs(active),
        completed: this.sanitizeJobs(completed.slice(-10)),
        failed: this.sanitizeJobs(failed.slice(-10)),
      },
    };
  }

  async retryFailedJob(queueName: string, jobId: string) {
    if (queueName === 'scraping') {
      const job = await this.scrapingQueue.getJob(jobId);
      if (job) {
        await job.retry();
        return { success: true, message: 'Job retried' };
      }
    } else if (queueName === 'notification') {
      const job = await this.notificationQueue.getJob(jobId);
      if (job) {
        await job.retry();
        return { success: true, message: 'Job retried' };
      }
    }

    return { success: false, message: 'Job not found' };
  }

  async deleteJob(queueName: string, jobId: string) {
    if (queueName === 'scraping') {
      const job = await this.scrapingQueue.getJob(jobId);
      if (job) {
        await job.remove();
        return { success: true, message: 'Job deleted' };
      }
    } else if (queueName === 'notification') {
      const job = await this.notificationQueue.getJob(jobId);
      if (job) {
        await job.remove();
        return { success: true, message: 'Job deleted' };
      }
    }

    return { success: false, message: 'Job not found' };
  }

  async clearQueue(queueName: string) {
    if (queueName === 'scraping') {
      await this.scrapingQueue.clean(0, 'completed');
      await this.scrapingQueue.clean(0, 'failed');
      return { success: true, message: 'Queue cleared' };
    } else if (queueName === 'notification') {
      await this.notificationQueue.clean(0, 'completed');
      await this.notificationQueue.clean(0, 'failed');
      return { success: true, message: 'Queue cleared' };
    }

    return { success: false, message: 'Queue not found' };
  }

  async createJob(queueName: string, data: any) {
    if (queueName === 'scraping') {
      const job = await this.scrapingQueue.add('manual-scrape', data);
      return { success: true, jobId: job.id, message: 'Scraping job added' };
    } else if (queueName === 'notification') {
      const job = await this.notificationQueue.add('manual-notification', data);
      return { success: true, jobId: job.id, message: 'Notification job added' };
    }
    return { success: false, message: 'Queue not found' };
  }

  private sanitizeJobs(jobs: Job[]) {
    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    }));
  }
}
