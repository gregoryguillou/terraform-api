# Tools

This document references a set of tools and scripts that might be of interest
for the project.

## Code analysis

Below is a basic evaluation of the project size. It should remain small to be
useful:

```shell
find . -type f \
   | grep -v node_modules | grep -v ".terraform" | grep -v vendor \
   | grep -v ".git" | grep -v build | grep -v tools | grep -v Gopkg \
   | grep -v package-lock | awk '{print "wc -l",$1}' | sh | sort -n \
   | awk '{print $1}' | paste -s -d+ - | bc
```

