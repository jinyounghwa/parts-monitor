import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    const warehouse = this.warehouseRepo.create(createWarehouseDto);
    const saved = await this.warehouseRepo.save(warehouse);
    this.logger.log(`Warehouse created: ${saved.code}`);
    return saved;
  }

  async findAll() {
    return this.warehouseRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.warehouseRepo.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, updateWarehouseDto);
    const updated = await this.warehouseRepo.save(warehouse);
    this.logger.log(`Warehouse updated: ${warehouse.code}`);
    return updated;
  }

  async remove(id: string) {
    const warehouse = await this.findOne(id);
    await this.warehouseRepo.remove(warehouse);
    this.logger.log(`Warehouse deleted: ${warehouse.code}`);
  }
}
