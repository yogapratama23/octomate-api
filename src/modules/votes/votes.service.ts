import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vote } from 'src/schemas/vote.schema';
import { CastVoteDto, CreateVoteDto } from './votes.dto';
import { generateSlug } from 'src/helpers/string.helper';
import { VoteOption } from 'src/schemas/vote-option.schema';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @InjectModel(VoteOption.name) private voteOptionModel: Model<VoteOption>,
  ) {}

  async createVote(input: CreateVoteDto): Promise<Vote> {
    try {
      const slug = generateSlug(input.title);
      const checkSlug = await this.voteModel.findOne({
        slug: slug,
      });
      if (checkSlug)
        throw new UnprocessableEntityException('vote already exists!');

      const vote = new this.voteModel({
        title: input.title,
        description: input.description,
        slug: slug,
        options: input.options.map((o) => ({ name: o, voters: [] })),
      });

      await vote.save();

      return vote;
    } catch (e) {
      throw e;
    }
  }

  async castVote(userId: string, slug: string, input: CastVoteDto) {
    try {
      const checkVote = await this.voteModel.findOne({ slug: slug });
      if (!checkVote) throw new NotFoundException('vote not found!');

      const alreadyVoted = checkVote.options.some((o) =>
        o.voters.some((vid) => vid.equals(userId)),
      );
      if (alreadyVoted)
        throw new UnprocessableEntityException('user has voted before!');

      const checkOption = checkVote.options.find((o) => o.name === input.name);
      if (!checkOption) {
        const newOption = new this.voteOptionModel({
          name: input.name,
          voters: [new Types.ObjectId(userId)],
        });

        checkVote.options.push(newOption);
      } else {
        checkOption.voters.push(new Types.ObjectId(userId));
      }

      await checkVote.save();

      return {
        message: 'your have voted successfully',
      };
    } catch (e) {
      throw e;
    }
  }

  async getVote(slug: string): Promise<Vote | null> {
    try {
      return this.voteModel.findOne({ slug }).select('-options.voters');
    } catch (e) {
      throw e;
    }
  }

  async getVotes(): Promise<Vote[]> {
    try {
      return this.voteModel.find().select('-options.voters');
    } catch (e) {
      throw e;
    }
  }

  async getVoteResult(slug: string) {
    try {
      const vote = await this.voteModel.findOne({ slug });

      return vote;
    } catch (e) {
      throw e;
    }
  }
}
