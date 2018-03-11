# Managing Couchbase

The environment relies on couchbase for now. The main reason is because it is
enough and simple. However, we should be able to move it to another backend
store. The sections below provides some hints to work this database

## Cleaning the database after some tests

Every document has a field name type that helps to search for documents a simple
way to clean the environment is by running the set of queries below:

```sql
CREATE INDEX type_idx ON data(type);
DELETE FROM data WHERE type='workspace';
DELETE FROM data WHERE type='event';
```
