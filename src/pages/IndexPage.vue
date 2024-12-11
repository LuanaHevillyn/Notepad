<template>
  <q-page>
    <q-form>
      <div class="q-pa-md q-gutter-md">
        <q-input
          :input-style="{ color: color }"
          :color="color"
          v-model="text"
          filled
          autogrow
          clearable
          @update:model-value="onInputChange"
        />
      </div>
    </q-form>
  </q-page>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const text = ref('')
const color = ref('')

onMounted(() => {
  toggleInputColor()
  changesFromMenu()
})

function openNewFile(fileContent: string) {
  text.value = fileContent
}

function saveChanges(filePath: string) {
  if (text.value.trim() == '') return
  window.file.sendTextForChanges(filePath, text.value)
}

function saveNewFile() {
  if (text.value.trim() == '') return
  window.file.sendTextForNewFile(text.value)
}

function cleanInput(content: string) {
  text.value = content
}

function changesFromMenu() {
  window.file.menuAction((menuActionData: string[]) => {
    if (menuActionData[0] == 'open-file') openNewFile(menuActionData[1]!)
    if (menuActionData[0] == 'save-changes') saveChanges(menuActionData[1]!)
    if (menuActionData[0] == 'save-new-file') saveNewFile()
    if (menuActionData[0] == 'clean-all') cleanInput(menuActionData[1]!)
  })
}

function toggleInputColor() {
  color.value = localStorage.getItem('input-color')!
  window.change.inputColor((inputColor) => 
  (localStorage.setItem('input-color', inputColor),
  (color.value = inputColor)),
  )
}

function onInputChange() {
  const firstLine = text.value.split('\n')[0];
  window.title.displayChangeIndicator(firstLine!.slice(0, 30));
}

</script>

<style>
:root {
  color-scheme: light dark;
}

@media (prefers-color-scheme: dark) {
  body {
    background: #333;
    color: white;
  }
}

@media (prefers-color-scheme: light) {
  body {
    background: #ddd;
    color: black;
  }
}
</style>
