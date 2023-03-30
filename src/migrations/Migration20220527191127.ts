import { Migration } from '@mikro-orm/migrations';

export class Migration20220527191127 extends Migration {
  public async up(): Promise<void> {
    await this.addSql(
      'create table "user" ("id" serial primary key, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "is_active" boolean not null default true);'
    );
    await this.addSql(
      `insert into "user" ("first_name", "last_name") values ('Matti', 'Karttunen');`
    );
  }

  public async down(): Promise<void> {
    await this.addSql('drop table if exists "user" cascade;');
  }
}
