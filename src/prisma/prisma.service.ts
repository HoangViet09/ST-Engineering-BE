import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as _ from 'lodash';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    this.$use(async (params, next) => {
      const getInfoUserLoginCondition =
        _.has(params.args, 'where.email') && params.action === 'findUnique';

      if (params.model !== 'User' || getInfoUserLoginCondition)
        return next(params);

      const result = await next(params);

      if (Array.isArray(result)) {
        return result.map((user) => {
          const { hash, ...userWithoutPassword } = user;

          return userWithoutPassword;
        });
      } else if (result) {
        const { hash, ...userWithoutPassword } = result;

        return userWithoutPassword;
      }
    });

    this.$use(async (params, next) => {
      const before = Date.now();

      const result = await next(params);

      const after = Date.now();

      console.log(
        `✨✨✨ Query ${params.model}.${params.action} took ${after - before}ms`,
      );

      return result;
    });
  }
}
