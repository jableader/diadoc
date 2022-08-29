FROM python:3.10
WORKDIR /code

ENV REFERENCE_PATH=/reference
ENV INDEX_PATH=/index

COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY app /code/app
COPY test-reference/lan /reference

COPY startup.sh startup.sh
RUN chmod +x startup.sh

CMD ["./startup.sh"]