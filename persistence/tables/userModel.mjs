import { DbConfig } from '../../lambdas/commons/database/handler/config.mjs';
import { rowToObject } from '../ormMapper.mjs';

export const UserModel = {
  schemaName: DbConfig.SCHEMA,
  tableName: 'user',
  qualifiedTableName: `${DbConfig.SCHEMA}.user`,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    roles: 'roles',
    email: 'email',
  },

  rowToObject: (row) => {
    return rowToObject(row, UserModel.columnToFieldMappings);
  }
};

export const User_UserMemberView = {
  schemaName: DbConfig.SCHEMA,
  columnToFieldMappings: {
    // audit trails
    enabled: 'enabled',
    creation_date: 'creationDate',
    modification_date: 'modificationDate',
    disabled_date: 'disabledDate',
    // business
    id: 'id',
    roles: 'roles',
    email: 'email',
    member_id: 'memberId',
  },
  selectStatement: `select u.*, member.member_id
                    from ${DbConfig.SCHEMA}."user" u
                    join (select id as member_id, email
                            from ${DbConfig.SCHEMA}.participant p
                           where p.email = $1
                           union
                          select id as member_id, email
                            from ${DbConfig.SCHEMA}.mentor m
                           where m.email = $1) member on member.email = u.email`,

  rowToObject: (row) => {
    return rowToObject(row, User_UserMemberView.columnToFieldMappings);
  }
};
