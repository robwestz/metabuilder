
import functools
import time
from concurrent.futures import ThreadPoolExecutor

# Simple cache decorator for functions with immutable args.
def cache(func):
    memo = {}
    @functools.wraps(func)
    def wrapper(*args):
        if args in memo:
            return memo[args]
        result = func(*args)
        memo[args] = result
        return result
    return wrapper

# Retry decorator with exponential backoff.
def retry(max_attempts=3, delay=0.5):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempts = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    attempts += 1
                    if attempts >= max_attempts:
                        raise e
                    time.sleep(delay * (2 ** (attempts - 1)))
        return wrapper
    return decorator

# Map a function over an iterable in parallel threads.
def parallel_map(fn, iterable, max_workers=4):
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        return list(executor.map(fn, iterable))
