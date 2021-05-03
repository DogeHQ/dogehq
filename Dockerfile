FROM node:buster

WORKDIR /dogehq

COPY . /

RUN ls -la / && \
        yarn && \
	npm i -g http-server && \
        yarn docs

COPY . .

CMD ["http-server", "./public", "--port ${PORT-8000}"]
