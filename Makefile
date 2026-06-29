PROJECT_NAME := wordMem
ARCHIVE := $(PROJECT_NAME).tar.gz

# Files and directories to exclude from the archive
EXCLUDES := --exclude='node_modules' \
            --exclude='.git' \
            --exclude='$(ARCHIVE)' \
            --exclude='.DS_Store'

.PHONY: archive clean

archive: $(ARCHIVE)

$(ARCHIVE):
	tar czf $(ARCHIVE) $(EXCLUDES) -C .. $(notdir $(CURDIR))

clean:
	rm -f $(ARCHIVE)
