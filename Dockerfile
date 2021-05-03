FROM node:buster

WORKDIR /dogehq

COPY . /dogehq

RUN ls -la /dogehq && \
        yarn && \
	npm i -g http-server && \
        yarn docs

COPY . .

CMD ["http-server", "./public", "--port ${PORT-8000}"]
