# eris-launch-check-app

A fixture of the Eris launch check. Listens on `PORT` (3000).

| Route          | Answers                                                     |
| -------------- | ----------------------------------------------------------- |
| `/healthz`     | `ok`                                                        |
| `/version`     | the contents of `VERSION`; a test commit writes a new value |
| `/env/:name`   | the SHA-256 of that variable, 404 when unset                |
| `/storage`     | `ok` when `SELECT 1` succeeds on `DATABASE_URL`             |
| `GET /volume`  | what was written to `$VOLUME_PATH/launch-check.txt` (`/data`) |
| `PUT /volume`  | writes the body there and reads it back                     |

`node task.js` exits 0, or 1 with `FAIL=1`. The branch `dockerfile` builds the
same app from a Dockerfile.
