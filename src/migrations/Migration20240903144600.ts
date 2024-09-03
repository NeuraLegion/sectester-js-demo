import { Migration } from '@mikro-orm/migrations';

export class Migration20240903144600 extends Migration {
  public override up(): void {
    this.addSql(
      'create table `user` (`id` integer not null primary key autoincrement, `first_name` text not null, `last_name` text not null, `is_active` integer not null default true);'
    );
    this.addSql(
      `insert into "user" ("first_name", "last_name") values ('Matti', 'Karttunen');`
    );
  }

  public override down(): void {
    this.addSql('drop table if exists "user";');
  }
}
