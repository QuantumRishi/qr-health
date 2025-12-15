import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecoveryModule } from './recovery/recovery.module';
import { MedicationsModule } from './medications/medications.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RemindersModule } from './reminders/reminders.module';
import { FamilyModule } from './family/family.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    RecoveryModule,
    MedicationsModule,
    ExercisesModule,
    RemindersModule,
    FamilyModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
