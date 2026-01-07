import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepo.create(createCustomerDto);
    const saved = await this.customerRepo.save(customer);
    this.logger.log(`Customer created: ${saved.code}`);
    return saved;
  }

  async findAll() {
    return this.customerRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const customer = await this.customerRepo.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    const updated = await this.customerRepo.save(customer);
    this.logger.log(`Customer updated: ${customer.code}`);
    return updated;
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    await this.customerRepo.remove(customer);
    this.logger.log(`Customer deleted: ${customer.code}`);
  }
}
