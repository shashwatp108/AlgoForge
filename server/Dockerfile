FROM node:18-slim

# 1. Install Compilers
RUN apt-get update && apt-get install -y g++ gcc python3 default-jdk

# 2. Create the non-root user
RUN useradd -m coderrunner

WORKDIR /app

# 3. Copy files (owned by root by default)
COPY package*.json ./
RUN npm install
COPY . .

# 4. Create temp folders
RUN mkdir -p codes inputs outputs temp

# 5. PERMISSIONS
# Give 'coderrunner' write access ONLY to the folders it needs
# The rest of /app remains root-owned (Read-Only for coderrunner)
RUN chown -R coderrunner:coderrunner /app/codes
RUN chown -R coderrunner:coderrunner /app/inputs
RUN chown -R coderrunner:coderrunner /app/outputs
RUN chown -R coderrunner:coderrunner /app/temp

# 6. Switch to the non-root user
USER coderrunner

EXPOSE 5000

CMD ["node", "index.js"]