FROM node:18-alpine
WORKDIR /app

# 1. Copy CHỈ file package.json CỦA RIÊNG service này
# (Đường dẫn './services/auth-service/' là vì context là '.')
COPY ./services/auth-service/package*.json ./

# 2. Cài đặt dependencies
RUN npm install

# 3. Copy CHỈ code CỦA RIÊNG service này vào /app
# (Chúng ta copy 'src' vào 'src', 'index.js' vào 'index.js' v.v...)
COPY ./services/auth-service/src ./src
# (Nếu bạn có các file khác như index.js ở ngoài src, cũng hãy COPY nó vào)
# COPY ./services/auth-service/index.js ./

# 4. Copy code DÙNG CHUNG (shared) vào
# Đây là bước "thần kỳ" sửa lỗi "Cannot find module"
COPY ./shared /shared

# Cổng của service này
EXPOSE 3001

# Lệnh CMD của bạn (npm start sẽ chạy "node src/index.js")
CMD ["npm", "start"]

