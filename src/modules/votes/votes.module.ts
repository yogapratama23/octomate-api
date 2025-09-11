import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Vote, VoteSchema } from 'src/schemas/vote.schema';
import { VoteOption, VoteOptionSchema } from 'src/schemas/vote-option.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vote.name, schema: VoteSchema },
      { name: VoteOption.name, schema: VoteOptionSchema },
    ]),
  ],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
