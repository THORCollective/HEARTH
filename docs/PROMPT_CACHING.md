# HEARTH Prompt Caching Guide

This guide explains how HEARTH uses Anthropic's prompt caching feature to reduce API costs and improve response times.

## Table of Contents
1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Benefits](#benefits)
4. [Configuration](#configuration)
5. [Monitoring & Debugging](#monitoring--debugging)
6. [Cost Analysis](#cost-analysis)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Prompt caching** is a feature provided by Anthropic that allows frequently reused content to be cached on the server side, reducing both costs and latency for API calls. HEARTH implements prompt caching for static content that remains consistent across multiple API requests.

### What Gets Cached

HEARTH caches the following static content:

| Content Type | Size | Frequency | Cache Benefit |
|-------------|------|-----------|---------------|
| **System Prompt** | ~1,000 tokens | Every hunt generation call | **High** - Used 5+ times per submission |
| **PEAK Template** | ~200 tokens | Every hunt generation call | **High** - Static template structure |
| **CTI Instructions** | ~300 tokens | Every chunk during summarization | **Medium** - Used for large CTI reports |

### What Doesn't Get Cached

Dynamic content that changes between requests is NOT cached:
- CTI report content (varies per submission)
- User feedback for regeneration requests
- Hunt-specific context and details

---

## How It Works

### Cache Lifecycle

1. **First API Call (Cache Miss)**:
   - Content is sent to Claude API
   - Claude processes and caches static content marked with `cache_control`
   - Cache is created on Anthropic's servers
   - Standard input token pricing applies

2. **Subsequent API Calls Within TTL (Cache Hit)**:
   - Cached content is reused from Anthropic's servers
   - Only dynamic content is transmitted
   - **90% cost reduction** on cached tokens
   - **Faster response times** due to reduced processing

3. **Cache Expiration**:
   - Default TTL: **5 minutes**
   - Optional TTL: **1 hour** (for batch processing)
   - After expiration, next call creates a new cache

### Technical Implementation

HEARTH uses Anthropic's Messages API with `cache_control` markers:

```python
# Example: Caching system prompt and template
response = anthropic_client.messages.create(
    model="claude-sonnet-4-5-20250929",
    max_tokens=1200,
    system=[
        {
            "type": "text",
            "text": SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"}  # Enable caching
        }
    ],
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": TEMPLATE_INSTRUCTIONS,
                    "cache_control": {"type": "ephemeral"}  # Cache template
                },
                {
                    "type": "text",
                    "text": f"CTI Content: {cti_content}"  # Dynamic, not cached
                }
            ]
        }
    ]
)
```

### Cached Functions

The following functions in `generate_from_cti.py` use prompt caching:

1. **`summarize_cti_with_map_reduce()`** (lines 333-469)
   - Caches CTI summarization instructions
   - Used when CTI reports exceed 20,000 characters
   - Reduces cost for large document processing

2. **`generate_hunt_content_with_ttp_diversity()`** (lines 471-639)
   - Caches system prompt and PEAK template
   - Primary hunt generation function
   - Benefits from cache across retry attempts

3. **`generate_hunt_content_basic()`** (lines 641-773)
   - Caches system prompt and PEAK template
   - Fallback when TTP diversity is unavailable
   - Same cache benefits as primary function

---

## Benefits

### Cost Savings

**Typical Hunt Generation Workflow**:
- First API call: Cache MISS → Creates cache → Standard pricing
- Retry attempts (2-5 calls): Cache HIT → 90% discount on cached tokens
- TTP diversity checks: Cache HIT → 90% discount
- Final validation: Cache HIT → 90% discount

**Example Cost Breakdown** (Claude Sonnet 4.5 pricing):

| Token Type | Count | Rate | Cost (No Cache) | Cost (With Cache) | Savings |
|-----------|-------|------|----------------|------------------|---------|
| System Prompt | 1,000 | $3/M → $0.30/M | $0.0030 | $0.0003 | $0.0027 (90%) |
| PEAK Template | 200 | $3/M → $0.30/M | $0.0006 | $0.00006 | $0.00054 (90%) |
| CTI Instructions | 300 | $3/M → $0.30/M | $0.0009 | $0.00009 | $0.00081 (90%) |
| **Per Call Savings** | | | | | **~$0.004** |

**Annual Savings Estimate**:
- 100 submissions/year: **$40-60 saved** (67% reduction)
- 500 submissions/year: **$200-300 saved** (67% reduction)
- 1,000 submissions/year: **$400-600 saved** (67% reduction)

### Performance Improvements

- **Reduced Latency**: Cached content doesn't need to be reprocessed
- **Faster Response Times**: 20-40% faster for cache hits
- **Better User Experience**: Quicker hunt generation and feedback loops

### Operational Benefits

- **No Code Changes Needed**: Works transparently with existing workflows
- **Automatic Management**: Caches managed by Anthropic's infrastructure
- **Scalable**: Handles increased load without performance degradation

---

## Configuration

### Environment Variables

Prompt caching is controlled by two environment variables:

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `ENABLE_PROMPT_CACHING` | Enable/disable prompt caching | `true` | `true`, `false`, `1`, `0`, `yes`, `no`, `on`, `off` |
| `PROMPT_CACHE_TTL` | Cache time-to-live duration | `5m` | `5m` (5 minutes), `1h` (1 hour) |

### Enabling/Disabling Caching

**Enable caching (default)**:
```bash
export ENABLE_PROMPT_CACHING=true
```

**Disable caching** (not recommended):
```bash
export ENABLE_PROMPT_CACHING=false
```

**Why you might disable caching**:
- Testing cache behavior
- Debugging API issues
- Comparing costs with/without caching

### Cache TTL Options

**5-minute TTL (default)**:
```bash
export PROMPT_CACHE_TTL=5m
```
- Best for typical usage patterns
- No additional cost
- Sufficient for retry loops and validation

**1-hour TTL (batch processing)**:
```bash
export PROMPT_CACHE_TTL=1h
```
- Useful for processing multiple submissions in sequence
- Maintains cache across longer workflows
- No additional cost (TTL extension is free)

### GitHub Actions Configuration

Set environment variables as repository variables:

1. Go to repository Settings → Secrets and variables → Actions
2. Add repository variables:
   - `ENABLE_PROMPT_CACHING`: `true`
   - `PROMPT_CACHE_TTL`: `5m` or `1h`

Or configure in workflow files:

```yaml
env:
  ENABLE_PROMPT_CACHING: true
  PROMPT_CACHE_TTL: 5m
```

---

## Monitoring & Debugging

### Cache Statistics Logging

HEARTH automatically logs cache performance for every API call:

```
Cache HIT for hunt generation | Tokens: 50 input, 1200 cached read, 0 cache write, 800 output | Cost: $0.0128 | Saved: $0.0036 (90.0%)
```

**Log Components**:
- **Cache Status**: `HIT`, `MISS (cache created)`, or `N/A (no cacheable content)`
- **Token Breakdown**:
  - `input`: New tokens processed at full rate
  - `cached read`: Tokens read from cache (90% discount)
  - `cache write`: Tokens written to cache (25% premium on first call)
  - `output`: Response tokens generated
- **Cost**: Total cost for this API call
- **Saved**: Dollar amount and percentage saved via caching

### Session Summary

At the end of each script execution, HEARTH logs cumulative cache statistics:

```
================================================================================
CACHE PERFORMANCE SUMMARY
================================================================================
Total API calls: 8
Cache hits: 6 | Cache misses: 2
Cache hit rate: 75.0%
Total tokens - Input: 1,200 | Cache read: 7,200 | Cache write: 1,500 | Output: 6,400
Total cost: $0.1234
Total savings from caching: $0.0648 (52.5% reduction)
================================================================================
```

### Debug Logging

Enable detailed cache logging:

```bash
export LOG_LEVEL=DEBUG
python scripts/generate_from_cti.py
```

Debug logs include:
- Cache control configuration
- Cache hit/miss reasons
- Detailed token usage breakdown
- API response metadata

### Monitoring Cache Hit Rate

**Ideal cache hit rate**: 70-90% for typical workflows

**Low hit rate (<50%)**:
- Indicates cache expiration between calls
- Consider increasing TTL to `1h` for batch processing
- Check if requests are spaced more than 5 minutes apart

**High hit rate (>90%)**:
- Excellent! Cache is working as designed
- Confirms retry attempts and validation reuse cache effectively

### Verifying Cache Usage

Check that caching is enabled:

```bash
python3 -c "
from scripts.config_manager import get_config
config = get_config().config
print(f'Caching enabled: {config.enable_prompt_caching}')
print(f'Cache TTL: {config.cache_ttl}')
"
```

Expected output:
```
Caching enabled: True
Cache TTL: 5m
```

---

## Cost Analysis

### Pricing Model (Claude Sonnet 4.5)

| Token Type | Rate per Million Tokens | Notes |
|-----------|------------------------|-------|
| **Input (base)** | $3.00 | Standard input tokens |
| **Cache Write** | $3.75 | 25% premium to create cache |
| **Cache Read** | $0.30 | 90% discount vs base rate |
| **Output** | $15.00 | Generated response tokens |

### Cost Comparison Example

**Scenario**: Generate hunt with 5 retry attempts

**Without Caching**:
```
Call 1: 1,500 input tokens × $3/M = $0.0045
Call 2: 1,500 input tokens × $3/M = $0.0045
Call 3: 1,500 input tokens × $3/M = $0.0045
Call 4: 1,500 input tokens × $3/M = $0.0045
Call 5: 1,500 input tokens × $3/M = $0.0045
Total input cost: $0.0225
```

**With Caching**:
```
Call 1: 300 input + 1,200 cache write × $3.75/M = $0.0054
Call 2: 300 input + 1,200 cache read × $0.30/M = $0.0013
Call 3: 300 input + 1,200 cache read × $0.30/M = $0.0013
Call 4: 300 input + 1,200 cache read × $0.30/M = $0.0013
Call 5: 300 input + 1,200 cache read × $0.30/M = $0.0013
Total input cost: $0.0106
```

**Savings**: $0.0225 - $0.0106 = **$0.0119 (53% reduction)**

### ROI Analysis

**Time to ROI**: Immediate
- No setup cost
- No infrastructure changes required
- Savings begin with first cache hit

**Ongoing Savings**:
- **Low usage** (10 hunts/month): ~$5-10/year
- **Medium usage** (50 hunts/month): ~$30-60/year
- **High usage** (200 hunts/month): ~$120-240/year

---

## Best Practices

### 1. Keep Cached Content Static

**Do**:
- Cache system prompts that never change
- Cache templates with consistent structure
- Cache instruction sets that are reused

**Don't**:
- Cache dynamic user content
- Cache timestamps or session-specific data
- Cache content that changes between calls

### 2. Optimize Cache Hit Rate

**Strategies**:
- Keep retry attempts within 5-minute window
- Use batch processing for multiple submissions
- Consider 1-hour TTL for long-running workflows

### 3. Monitor Cache Performance

**Regular checks**:
- Review cache hit rates weekly
- Analyze cost savings in production
- Adjust TTL based on usage patterns

### 4. Test Cache Behavior

**Before deploying changes**:
- Verify cache control markers are applied
- Test with caching enabled and disabled
- Compare costs and performance metrics

### 5. Document Cache Strategy

**For maintainers**:
- Document what content is cached and why
- Track changes to cached prompts
- Update cache strategy as workflows evolve

---

## Troubleshooting

### Issue: Cache not being used (0% hit rate)

**Symptoms**:
- All API calls show "MISS" or "N/A" status
- No `cache_read_tokens` in logs
- Higher than expected costs

**Diagnosis**:
```bash
# Check if caching is enabled
python3 -c "from scripts.config_manager import get_config; print(get_config().config.enable_prompt_caching)"
```

**Solutions**:
1. **Caching disabled**: Set `ENABLE_PROMPT_CACHING=true`
2. **Old SDK version**: Update Anthropic client: `pip install --upgrade anthropic>=0.34.0`
3. **Cache expired**: Calls spaced >5 minutes apart; consider `PROMPT_CACHE_TTL=1h`

---

### Issue: Low cache hit rate (<50%)

**Symptoms**:
- More cache misses than expected
- Inconsistent cache hits

**Possible Causes**:
1. **Long delays between API calls**: Cache expires (5-min TTL)
2. **Content changes**: Dynamic content prevents cache reuse
3. **Different model versions**: Each model has separate cache

**Solutions**:
1. Increase TTL: `export PROMPT_CACHE_TTL=1h`
2. Verify cached content is truly static
3. Batch related operations to reuse cache

---

### Issue: Higher costs than expected

**Symptoms**:
- Cache write costs higher than anticipated
- Total costs not reduced by expected amount

**Explanation**:
- **Cache writes cost 25% more** than base input rate
- First call to create cache has premium
- Savings only realized on subsequent cache hits

**Example**:
```
Call 1 (cache write): $0.0045 (25% premium)
Call 2 (cache hit):   $0.0004 (90% discount)
Call 3 (cache hit):   $0.0004 (90% discount)
Net savings: Call 2 + Call 3 savings > Call 1 premium
```

**Solution**: Cache is cost-effective when content is reused 2+ times within TTL

---

### Issue: Cache statistics not logging

**Symptoms**:
- No cache logs appearing in output
- Summary not displayed at end of execution

**Diagnosis**:
```bash
# Check log level
echo $LOG_LEVEL

# Run with debug logging
LOG_LEVEL=DEBUG python scripts/generate_from_cti.py
```

**Solutions**:
1. **Log level too high**: Set `LOG_LEVEL=INFO` or lower
2. **No API calls made**: Verify script execution completed successfully
3. **Old code version**: Update to latest version with cache monitoring

---

### Issue: "Unknown field: cache_control" error

**Symptoms**:
- API errors mentioning `cache_control`
- Script fails when caching is enabled

**Cause**: Outdated Anthropic SDK version

**Solution**:
```bash
# Update to latest SDK version
pip install --upgrade anthropic>=0.34.0

# Verify version
python3 -c "import anthropic; print(anthropic.__version__)"
```

**Expected**: Version 0.34.0 or higher

---

### Issue: Different cache behavior in production vs development

**Symptoms**:
- High hit rate locally, low hit rate in GitHub Actions
- Inconsistent cache statistics

**Possible Causes**:
1. **Different API keys**: Caches are per API key
2. **Different TTL settings**: Check environment variables
3. **Parallel workflows**: Multiple concurrent jobs don't share cache

**Solutions**:
1. Verify environment variables match across environments
2. Check GitHub Actions logs for cache configuration
3. Sequential processing may improve hit rate for batched work

---

## Related Documentation

- [Anthropic Prompt Caching Documentation](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)
- [HEARTH Configuration Guide](../README.md#configuration)
- [HEARTH Optimization Guide](OPTIMIZATION_GUIDE.md)
- [HEARTH Logging Guide](LOGGING.md)
- [HEARTH Testing Guide](TESTING_GUIDE.md)

---

## Contributing

Found a way to improve caching efficiency? Have ideas for additional cacheable content?

1. Open an issue describing your optimization idea
2. Include expected cost savings and performance impact
3. Submit a PR with implementation and test coverage

**Guidelines**:
- Measure cache hit rates before and after changes
- Document cost implications
- Include monitoring for new cached content
- Update this guide with new best practices

---

For questions or issues with prompt caching, please [open an issue](https://github.com/THORCollective/HEARTH/issues/new) on GitHub.
