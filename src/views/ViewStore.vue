<template>
  <div class="view-store">
    <h1>This is an view-store page</h1>
    <p @click="$store.commit('add')">click here add counter: {{$store.state.counter}}</p>
    <p @click="$store.dispatch('add')">click here async add counter: {{$store.state.counter}}</p>
    <p>getters doubleCounter: {{$store.getters.doubleCounter}}</p>
  </div>
</template>
