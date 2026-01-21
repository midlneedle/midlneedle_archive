# Dev Server

Запускает dev-сервер и открывает сайт в браузере.

## Инструкции

1. Запусти dev-сервер в фоновом режиме через node с полным путём и флагом --webpack:
   ```bash
   /usr/local/Cellar/node/25.3.0/bin/node ./node_modules/.bin/next dev --webpack
   ```
   Используй `run_in_background: true` для запуска в фоне.

2. Подожди 5 секунд, чтобы сервер успел запуститься:
   ```bash
   sleep 5
   ```

3. Открой браузер на localhost:3000:
   ```bash
   open http://localhost:3000
   ```

4. Проверь вывод сервера:
   ```bash
   tail -20 /private/tmp/claude/-Users-Vladislav-Documents-Code-Web-mine-midlneedle----coooom/tasks/{task_id}.output
   ```

5. Сообщи пользователю, что dev-сервер запущен в фоне и браузер открыт. Покажи URL сервера из вывода. Для остановки используй `/tasks` и KillShell с ID задачи.
