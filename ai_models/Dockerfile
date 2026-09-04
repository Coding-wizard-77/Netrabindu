FROM python:3.11-slim
WORKDIR /app
COPY ai_models/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PYTHONPATH=.
CMD ["python", "-m", "ai_models.worker"]
