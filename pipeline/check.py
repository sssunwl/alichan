#!/usr/bin/env python3
"""檢查 AI 寫嘅攻略草稿：有冇作數字、有冇用錯語言、有冇 AI 腔。

用法：python3 pipeline/check.py <草稿資料夾> [<草稿資料夾> ...]
每個資料夾入面係 <VIDEO_ID>.json，對應 _transcripts/<VIDEO_ID>.txt。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANNED = ['總括而言', '值得一提', '讓我們', '不容錯過', '必去清單', '總而言之', '絕對不能錯過', '一站式']
YUE = ['係', '嘅', '唔', '咗', '喺', '啲', '佢', '冇']
MANDARIN = ['是', '的', '不', '了', '在', '他們', '沒有']
EMOJI = re.compile('[\U0001F300-\U0001FAFF☀-➿]')


def numbers(text: str) -> set[str]:
    # 抽出所有數字（去千位逗號），忽略 1 位數同時間碼
    out = set()
    for m in re.finditer(r'\d[\d,]*(?:\.\d+)?', text):
        n = m.group().replace(',', '')
        if len(n) >= 2:
            out.add(n)
    return out


def strings(o) -> list[str]:
    if isinstance(o, str):
        return [o]
    if isinstance(o, list):
        return [s for x in o for s in strings(x)]
    if isinstance(o, dict):
        return [s for k, v in o.items() if k not in ('t', 'slug') for s in strings(v)]
    return []


def check(path: Path) -> dict:
    vid = path.stem
    src = (ROOT / '_transcripts' / f'{vid}.txt').read_text(encoding='utf-8')
    raw = path.read_text(encoding='utf-8')
    try:
        d = json.loads(raw)
    except json.JSONDecodeError as e:
        return {'video': vid, 'error': f'JSON 壞咗：{e}'}
    text = '\n'.join(strings({k: v for k, v in d.items() if k != 'needsCheck'}))
    src_nums = numbers(src)
    # 換算/相加得出嘅數字唔一定喺原文，列出嚟俾人睇，唔自動判死
    unknown = sorted(n for n in numbers(text) if n not in src_nums)
    yue = sum(text.count(w) for w in YUE)
    man = sum(text.count(w) for w in MANDARIN)
    return {
        'video': vid,
        'chars': len(text),
        'sections': len(d.get('sections') or []),
        'faq': len(d.get('faq') or []),
        'facts': len(d.get('facts') or []),
        'places': len(d.get('places') or []),
        'needsCheck': len(d.get('needsCheck') or []),
        'unknown_numbers': unknown,
        'cantonese_ratio': round(yue / max(1, yue + man), 2),
        'halfwidth_punct': len(re.findall(r'[一-鿿][,:;!?]|[,:;!?][一-鿿]', text)),
        'banned': [w for w in BANNED if w in text],
        'emoji': len(EMOJI.findall(text)),
        'missing_t': sum(1 for s in (d.get('sections') or []) if not isinstance(s.get('t'), int)),
    }


def main():
    for folder in sys.argv[1:]:
        print(f'\n## {folder}')
        for p in sorted(Path(folder).glob('*.json')):
            r = check(p)
            print(json.dumps(r, ensure_ascii=False))


if __name__ == '__main__':
    main()
