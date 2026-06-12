import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly users = new Map<string, User>();

  create(createUserDto: CreateUserDto): User {
    if (!createUserDto.fname?.trim() || !createUserDto.lname?.trim()) {
      throw new BadRequestException('fname and lname are required');
    }

    const now = new Date();
    const user: User = {
      id: randomUUID(),
      fname: createUserDto.fname.trim(),
      lname: createUserDto.lname.trim(),
      email: createUserDto.email?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    return user;
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findOne(id: string): User {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const user = this.findOne(id);
    const hasUpdates =
      updateUserDto.fname !== undefined ||
      updateUserDto.lname !== undefined ||
      updateUserDto.email !== undefined;

    if (!hasUpdates) {
      throw new BadRequestException('At least one field must be provided');
    }

    if (updateUserDto.fname !== undefined) {
      if (!updateUserDto.fname.trim()) {
        throw new BadRequestException('fname cannot be empty');
      }
      user.fname = updateUserDto.fname.trim();
    }

    if (updateUserDto.lname !== undefined) {
      if (!updateUserDto.lname.trim()) {
        throw new BadRequestException('lname cannot be empty');
      }
      user.lname = updateUserDto.lname.trim();
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email.trim() || undefined;
    }

    user.updatedAt = new Date();
    this.users.set(id, user);
    return user;
  }

  remove(id: string): void {
    if (!this.users.has(id)) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    this.users.delete(id);
  }
}
