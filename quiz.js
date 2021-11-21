Vue.component("accordion", {
  template: `
        <div class="accordion">
          <transition name="accordion" @before-enter="beforeEnter" @enter="enter" @before-leave="beforeLeave" @leave="leave">
            <div class="accordion-body" v-if="isCorrect == 1">
              <slot name="OK"></slot>
            </div>
			<div class="accordion-body" v-if="isCorrect == 2">
              <slot name="NG"></slot>
            </div>
          </transition>
        </div>
        `,
  props: ["choice"],
  data() {
    return {
      isCorrect: Number,
      answer: 1,
    };
  },
  methods: {
    childToggle() {
      if (this.choice == this.answer) this.isCorrect = 1;
      else this.isCorrect = 2;
    },
    beforeEnter: function (el) {
      el.style.height = "0";
    },
    enter: function (el) {
      el.style.height = el.scrollHeight + "px";
    },
    beforeLeave: function (el) {
      el.style.height = el.scrollHeight + "px";
    },
    leave: function (el) {
      el.style.height = "0";
    },
  },
});

new Vue({
  el: "#quiz",
  data: {
    choice: Number,
  },
  methods: {
    toggle: function () {
      this.$refs.accordion.childToggle();
    },
  },
});
