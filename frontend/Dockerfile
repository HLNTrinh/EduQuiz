# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Accept build-time override for API URL and export it to environment
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY package*.json ./

RUN npm install

COPY . .

# Build will pick up REACT_APP_API_URL injected above
RUN npm run build


# =========================
# Production stage - nginx
# =========================
FROM nginx:stable-alpine


# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

