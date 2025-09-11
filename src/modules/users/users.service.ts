import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserType } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getUsers(userId: string): Promise<User[] | null> {
    try {
      return this.userModel
        .find({
          _id: { $ne: userId },
          user_type: { $ne: UserType.ADMIN },
        } as any)
        .exec();
    } catch (e) {
      throw e;
    }
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      await this.userModel.deleteOne(new Types.ObjectId(userId));
      return { message: 'delete success' };
    } catch (e) {
      throw e;
    }
  }
}
