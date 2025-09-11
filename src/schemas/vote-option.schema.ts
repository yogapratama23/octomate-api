import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type VoteOptionDocument = HydratedDocument<VoteOption>;

@Schema({ timestamps: true })
export class VoteOption {
  _id: Types.ObjectId;

  @Prop()
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  voters: Types.ObjectId[];
}

export const VoteOptionSchema = SchemaFactory.createForClass(VoteOption);
