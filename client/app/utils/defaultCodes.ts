export const defaultCodes = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello AlgoForge!" << endl;
    return 0;
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello AlgoForge!\\n");
    return 0;
}`,
  python: `print("Hello AlgoForge!")

# Example of input
# x = input()
# print("You typed:", x)`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello AlgoForge!");
    }
}`,
  javascript: `console.log("Hello AlgoForge!");`
};