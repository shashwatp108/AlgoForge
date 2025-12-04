FROM node:18-slim

# 1. Install Compilers
RUN apt-get update && apt-get install -y g++ gcc python3 default-jdk

# 2. Create the non-root user
RUN useradd -m coderrunner

WORKDIR /app

# 3. Copy files
COPY package*.json ./
RUN npm install
COPY . .

# 4. Create temp folders explicitly
RUN mkdir -p codes inputs outputs temp

# 5. PERMISSIONS (Crucial Step)
# Give coderrunner write access to these folders
RUN chown -R coderrunner:coderrunner /app/codes
RUN chown -R coderrunner:coderrunner /app/inputs
RUN chown -R coderrunner:coderrunner /app/outputs
RUN chown -R coderrunner:coderrunner /app/temp

# 6. Switch User
USER coderrunner

EXPOSE 5000

CMD ["node", "index.js"]