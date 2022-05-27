import { Migration } from '@mikro-orm/migrations';

export class Migration20220527131602 extends Migration {
  public async up(): Promise<void> {
    await this.addSql(
      'create table `user` (`id` int unsigned not null auto_increment primary key, `first_name` varchar(255) not null, `last_name` varchar(255) not null, `is_active` tinyint(1) not null default true) default character set utf8mb4 engine = InnoDB;'
    );
  }

  public async down(): Promise<void> {
    await this.addSql('drop table if exists `user`;');
  }
}
