FROM node:14

WORKDIR /dogehq

COPY ["package.json", "yarn.lock", "./"]

RUN yarn && \
	npm i -g http-server

COPY . .

RUN yarn docs

CMD ["http-server", "./public", "--port ${PORT-8000}"]
