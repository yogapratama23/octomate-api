import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum UserType {
  VOTER = 'voter',
  ADMIN = 'administrator',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ enum: UserType, default: UserType.VOTER })
  user_type: UserType;
}

export const UserSchema = SchemaFactory.createForClass(User);
