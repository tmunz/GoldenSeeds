import React from 'react';
import { useTranslation } from '../../../i18n/I18n';

export function ExpressionHelp() {
  const { t } = useTranslation();
  return <>
    <p>{t('expression.intro')}</p>
    <h3>{t('expression.variables')}</h3>
    <dl>
      <dt><code>n</code></dt><dd>{t('expression.index')}</dd>
      <dt><code>items</code></dt><dd>{t('expression.items')}</dd>
      <dt><code>i</code></dt><dd>{t('expression.pointIndex')}</dd>
      <dt><code>itemSize</code></dt><dd>{t('expression.itemSize')}</dd>
    </dl>
    <p>{t('expression.context')}</p>
    <h3>{t('expression.constants')}</h3>
    <dl>
      <dt><code>goldenRatio</code></dt><dd>≈ 1.618</dd>
      <dt><code>Math.PI</code></dt><dd>≈ 3.142</dd>
      <dt><code>Math.E</code></dt><dd>≈ 2.718</dd>
    </dl>
    <h3>{t('expression.functions')}</h3>
    <p><code>fib(n)</code> — {t('expression.fibonacci')}</p>
    <p><code>Math.sin(n), Math.cos(n), Math.sqrt(n), Math.pow(n, 2), Math.abs(n), Math.min(n, items), Math.max(n, items)</code></p>
    <p>{t('expression.radians')}</p>
    <h3>{t('expression.example')}</h3>
    <pre><code>n * 360 / goldenRatio</code></pre>
  </>;
}
