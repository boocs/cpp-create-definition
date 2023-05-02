# C++ Create Definition VSCode extension

https://github.com/boocs/cpp-create-definition

In a header file right click on a function declaration and choose `C++ Create Definition` in the context menu.

It'll will try to find/open the source file and paste the Definition skeleton at the bottom.

* It tries to find the class name in the header file
* If it can't it'll copy the class name from a function in the source file
* If it can't it'll copy function definition without class name

---