FROM node:14

WORKDIR /dogehq

COPY ["package.json", "yarn.lock", "./"]

RUN yarn && \
	npm i -g http-server && \
	yarn docs

COPY . .

CMD ["http-server", "./public", "--port ${PORT-8000}"]
