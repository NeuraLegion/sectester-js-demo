import { Migration } from '@mikro-orm/migrations';

export class Migration20240903144600 extends Migration {
  public override up(): void {
    this.addSql(
      'create table `user` (`id` integer not null primary key autoincrement, `first_name` text not null, `last_name` text not null, `is_active` integer not null default true);'
    );
    this.addSql(
      `insert into user (id, first_name, last_name) values (1, 'Brynna', 'Lapping');`
    );
    this.addSql(
      `insert into user (id, first_name, last_name) values (2, 'Ginnie', 'Denisard');`
    );
    this.addSql(
      `insert into user (id, first_name, last_name) values (3, 'Emelita', 'Engley');`
    );
    this.addSql(
      `insert into user (id, first_name, last_name) values (4, 'Bryanty', 'Craigmyle');`
    );
    this.addSql(
      `insert into user (id, first_name, last_name) values (5, 'Nolan', 'Portchmouth');`
    );
  }

  public override down(): void {
    this.addSql('drop table if exists "user";');
  }
}
