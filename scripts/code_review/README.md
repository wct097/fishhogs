# Code Review Bundler

A universal code review bundler that creates comprehensive Markdown documentation of your codebase for AI-assisted review.

**Source**: https://github.com/Strode-Mountain/ai-setup

## Features

- **Universal language support**: Works with Android, JavaScript/TypeScript, Python, and more
- **Automatic file splitting**: Splits large bundles when they exceed size limits (default 8MB)
- **Smart file selection**: Includes source code and important configs, excludes binaries and lock files
- **Previous output cleanup**: Automatically removes old bundle files before generating new ones
- **TODO/FIXME tracking**: Scans for and summarizes TODO, FIXME, XXX, HACK, and BUG comments
- **Configurable limits**: Control maximum file size and bundle size via arguments or environment variables

## Outputs

Generated in `scripts/code_review/output/`:
- `CODE_REVIEW_BUNDLE.md` (or `CODE_REVIEW_BUNDLE_001.md`, `_002.md`, etc. for large codebases)
- `REVIEW_PROMPT.md` — AI reviewer instructions that reference the bundle file(s)

## Usage

```bash
# From repo root (recommended)
python3 scripts/code_review/bundle_review.py

# Or from anywhere
python3 scripts/code_review/bundle_review.py --root /path/to/repo

# Limit the number of files included (keeps most recent N)
python3 scripts/code_review/bundle_review.py --max-files 800

# Set maximum bundle size (in MB, default is 8)
python3 scripts/code_review/bundle_review.py --max-bundle-mb 20

# Combine options
python3 scripts/code_review/bundle_review.py --root /path/to/repo --max-files 500 --max-bundle-mb 10
```

## Environment Variables

```bash
# Set default maximum file size to include (bytes, default 256KB)
export BUNDLE_MAX_FILE_BYTES=524288  # 512KB

# Set default maximum bundle size (MB, default 8)
export BUNDLE_MAX_BUNDLE_MB=20
```
