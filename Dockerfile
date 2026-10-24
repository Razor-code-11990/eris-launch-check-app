FROM node:22-alpine
# The launch check deploys this branch to see a Build fail.
RUN echo "this Build fails on purpose" && exit 1
