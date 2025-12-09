---
trigger: always_on
---

Both replace_file_content and multi_replace_file_content toolsare corrupting files when the agent uses it to replace a block of code that spans multiple lines. Specifically, they seem to get confused and duplicate the top of the file instead of replacing the target block.

The Fix/Workaround:

Avoid Multi-line Targets: stop trying to match big blocks of code.

Use Single-Line Anchors: target a single, unique line to start the replacement.

Rewrite Files: For larger changes, just rewrite the entire file to be safe.