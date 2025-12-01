# 1. Use the official Node.js image as the base (It's a Linux OS)
FROM node:18-slim

# 2. CRITICAL STEP: Install the C++ Compiler (g++)
# We update the package manager and install g++
RUN apt-get update && apt-get install -y g++ build-essential

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy package.json to install dependencies first (for caching)
COPY package*.json ./

# 5. Install Node dependencies
RUN npm install

# 6. Copy the rest of your server code
COPY . .

# 7. Create the folders for codes and outputs (just in case)
RUN mkdir -p codes outputs

# 8. Expose the port Render expects
EXPOSE 5000

# 9. The command to start your server
CMD ["node", "index.js"]
