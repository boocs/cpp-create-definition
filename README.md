# C++ Create Definition VSCode extension

https://github.com/boocs/cpp-create-definition



## How to Install

1. Download the .vsix file from this github
2. Install inside VSCode:

![image](https://user-images.githubusercontent.com/62588629/225083466-39ca4a93-e06a-4a04-83ba-82d60b548513.png)


-----
## How To use
In a header file right click on a function declaration and choose `C++ Create Definition` in the context menu.

![](https://user-images.githubusercontent.com/62588629/236618169-5e904abd-bafe-4fac-8b2d-67fc72f20173.png)

It'll will try to find/open the source file and paste the Definition skeleton at the bottom.

* It tries to find the class name in the header file
* If it can't it'll copy the class name from a function in the source file
* If it can't it'll copy function definition without class name


---
## Help

https://github.com/boocs/cpp-create-definition/issues

When asking for help provide class Name line and function name line:

```
class AFPS5_2Character : public ACharacter
```

```
void SetHasRifle(bool bNewHasRifle);
```

## Latest updates

## [1.1.1] - 2023-09-16
### Update
- npm audit fix

## [1.1.0] - 2023-09-13
### Added
- Multi line support
- Create without switching to source file
### Fixed
- more reliable classname
- Removed errant spaces