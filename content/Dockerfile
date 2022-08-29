FROM python:3.10
WORKDIR /code

COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY app /code/app
COPY test-reference/lan /reference

ENV REFERENCE_PATH=/reference
ENV INDEX_PATH=/index

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]