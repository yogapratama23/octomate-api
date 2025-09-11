import { Test, TestingModule } from '@nestjs/testing';
import { VotesService } from './votes.service';
import { getModelToken } from '@nestjs/mongoose';
import { Vote } from 'src/schemas/vote.schema';
import { VoteOption } from 'src/schemas/vote-option.schema';
import {
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as stringHelper from 'src/helpers/string.helper';

// mock helpers
jest.mock('src/helpers/string.helper', () => ({
  generateSlug: jest.fn(),
}));

describe('VotesService', () => {
  let service: VotesService;
  let voteModel: any;
  let voteOptionModel: any;

  beforeEach(async () => {
    // mock constructor function
    voteModel = jest.fn();
    // attach static-like methods
    voteModel.findOne = jest.fn();
    voteModel.find = jest.fn();

    // mock VoteOption model
    voteOptionModel = jest.fn().mockImplementation((data) => ({
      ...data,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesService,
        { provide: getModelToken(Vote.name), useValue: voteModel },
        { provide: getModelToken(VoteOption.name), useValue: voteOptionModel },
      ],
    }).compile();

    service = module.get<VotesService>(VotesService);
  });

  describe('createVote', () => {
    it('should create a new vote when slug is unique', async () => {
      (stringHelper.generateSlug as jest.Mock).mockReturnValue('test-slug');
      voteModel.findOne.mockResolvedValue(null);

      const mockSave = jest.fn().mockResolvedValue(true);
      const mockVoteInstance = { save: mockSave };
      (voteModel as jest.Mock).mockImplementation(() => mockVoteInstance);

      const input = {
        title: 'Test Vote',
        description: 'desc',
        options: ['A', 'B'],
      };
      const result = await service.createVote(input as any);

      expect(stringHelper.generateSlug).toHaveBeenCalledWith('Test Vote');
      expect(voteModel.findOne).toHaveBeenCalledWith({ slug: 'test-slug' });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(mockVoteInstance);
    });

    it('should throw if slug already exists', async () => {
      (stringHelper.generateSlug as jest.Mock).mockReturnValue('test-slug');
      voteModel.findOne.mockResolvedValue({ slug: 'test-slug' });

      await expect(
        service.createVote({
          title: 'Test',
          description: '',
          options: [],
        } as any),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('castVote', () => {
    it('should throw if vote not found', async () => {
      voteModel.findOne.mockResolvedValue(null);
      await expect(
        service.castVote('1', 'slug', { name: 'A' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if user already voted', async () => {
      const userId = new Types.ObjectId();
      const checkVote = {
        options: [{ name: 'A', voters: [userId] }],
      };
      voteModel.findOne.mockResolvedValue(checkVote);

      await expect(
        service.castVote(userId.toString(), 'slug', { name: 'A' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should add new option if not exists', async () => {
      const userId = new Types.ObjectId();
      const checkVote = {
        options: [],
        save: jest.fn().mockResolvedValue(true),
      };
      voteModel.findOne.mockResolvedValue(checkVote);

      const result = await service.castVote(userId.toString(), 'slug', {
        name: 'NewOption',
      });

      expect(checkVote.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'your have voted successfully' });
    });

    it('should push voter to existing option', async () => {
      const userId = new Types.ObjectId();
      const checkVote = {
        options: [{ name: 'A', voters: [] }],
        save: jest.fn().mockResolvedValue(true),
      };
      voteModel.findOne.mockResolvedValue(checkVote);

      const result = await service.castVote(userId.toString(), 'slug', {
        name: 'A',
      });

      expect(checkVote.options[0].voters).toHaveLength(1);
      expect(result).toEqual({ message: 'your have voted successfully' });
    });
  });

  describe('getVote', () => {
    it('should return a vote by slug', async () => {
      voteModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue('vote-data'),
      });

      const result = await service.getVote('slug');
      expect(result).toEqual('vote-data');
    });
  });

  describe('getVotes', () => {
    it('should return all votes', async () => {
      voteModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue(['vote1', 'vote2']),
      });

      const result = await service.getVotes();
      expect(result).toEqual(['vote1', 'vote2']);
    });
  });

  describe('getVoteResult', () => {
    it('should return a vote with options and voters', async () => {
      voteModel.findOne.mockResolvedValue('vote-result');
      const result = await service.getVoteResult('slug');
      expect(result).toEqual('vote-result');
    });
  });
});
