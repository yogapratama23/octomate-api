import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { VoteOption, VoteOptionSchema } from './vote-option.schema';

export type VoteDocument = HydratedDocument<Vote>;

export enum VoteStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Schema({ timestamps: true })
export class Vote {
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  slug: string;

  @Prop({ enum: VoteStatus, default: VoteStatus.OPEN })
  vote_status: VoteStatus;

  @Prop({ type: [VoteOptionSchema], default: [] })
  options: VoteOption[];
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
