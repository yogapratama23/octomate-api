import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto, CreateVoteDto } from './votes.dto';
import { User } from '../users/users.decorator';
import { Roles } from '../roles/roles.decorator';
import { UserType } from 'src/schemas/user.schema';
import { RolesGuard } from '../roles/roles.guard';

@Controller('votes')
export class VotesController {
  constructor(private votesService: VotesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserType.ADMIN)
  async createVote(@Body() body: CreateVoteDto) {
    return this.votesService.createVote(body);
  }

  @Post('cast-vote/:slug')
  @UseGuards(RolesGuard)
  @Roles(UserType.VOTER)
  async castVote(
    @User() user: any,
    @Param('slug') slug: string,
    @Body() body: CastVoteDto,
  ) {
    return this.votesService.castVote(user.sub, slug, body);
  }

  @Get('/:slug')
  async getVote(@Param('slug') slug: string) {
    return this.votesService.getVote(slug);
  }

  @Get()
  async getVotes() {
    return this.votesService.getVotes();
  }

  @Get('/:slug/result')
  async getVoteResult(@Param('slug') slug: string) {
    return this.votesService.getVoteResult(slug);
  }
}
