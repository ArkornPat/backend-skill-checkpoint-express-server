// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:Petch@1234@localhost:5432/Backend Skill Checkpoint",
});

export default connectionPool;
