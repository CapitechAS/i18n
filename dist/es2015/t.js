var _dec, _class, _dec2, _class2, _class3, _temp;

import { I18N } from './i18n';
import { EventAggregator } from 'aurelia-event-aggregator';
import { metadata } from 'aurelia-metadata';
import { customAttribute, HtmlBehaviorResource } from 'aurelia-templating';
import { SignalBindingBehavior } from 'aurelia-templating-resources';
import { ValueConverter } from 'aurelia-binding';
import { DOM } from 'aurelia-pal';
import { LazyOptional } from './utils';

export let TValueConverter = class TValueConverter {
  static inject() {
    return [I18N];
  }
  constructor(i18n) {
    this.service = i18n;
  }

  toView(value, options) {
    return this.service.tr(value, options);
  }
};

export let TParamsCustomAttribute = (_dec = customAttribute('t-params'), _dec(_class = class TParamsCustomAttribute {
  static inject() {
    return [DOM.Element];
  }
  static configureAliases(aliases) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, TParamsCustomAttribute);
    r.aliases = aliases;
  }


  constructor(element) {
    this.element = element;
  }

  valueChanged() {}
}) || _class);

export let TCustomAttribute = (_dec2 = customAttribute('t'), _dec2(_class2 = class TCustomAttribute {

  static inject() {
    return [DOM.Element, I18N, EventAggregator, LazyOptional.of(TParamsCustomAttribute)];
  }
  static configureAliases(aliases) {
    let r = metadata.getOrCreateOwn(metadata.resource, HtmlBehaviorResource, TCustomAttribute);
    r.aliases = aliases;
  }

  constructor(element, i18n, ea, tparams) {
    this.element = element;
    this.service = i18n;
    this.ea = ea;
    this.lazyParams = tparams;
  }

  bind() {
    this.params = this.lazyParams();

    if (this.params) {
      this.params.valueChanged = (newParams, oldParams) => {
        this.paramsChanged(this.value, newParams, oldParams);
      };
    }

    let p = this.params !== null ? this.params.value : undefined;
    this.subscription = this.ea.subscribe('i18n:locale:changed', () => {
      this.service.updateValue(this.element, this.value, this.params !== null ? this.params.value : undefined);
    });

    this.service.updateValue(this.element, this.value, p);
  }

  paramsChanged(newValue, newParams) {
    this.service.updateValue(this.element, newValue, newParams);
  }

  valueChanged(newValue) {
    let p = this.params !== null ? this.params.value : undefined;
    this.service.updateValue(this.element, newValue, p);
  }

  unbind() {
    if (this.subscription) {
      this.subscription.dispose();
    }
  }
}) || _class2);

export let TBindingBehavior = (_temp = _class3 = class TBindingBehavior {

  constructor(signalBindingBehavior) {
    this.signalBindingBehavior = signalBindingBehavior;
  }

  bind(binding, source) {
    this.signalBindingBehavior.bind(binding, source, 'aurelia-translation-signal');

    let sourceExpression = binding.sourceExpression;

    if (sourceExpression.rewritten) {
      return;
    }
    sourceExpression.rewritten = true;

    let expression = sourceExpression.expression;
    sourceExpression.expression = new ValueConverter(expression, 't', sourceExpression.args, [expression, ...sourceExpression.args]);
  }

  unbind(binding, source) {
    this.signalBindingBehavior.unbind(binding, source);
  }
}, _class3.inject = [SignalBindingBehavior], _temp);