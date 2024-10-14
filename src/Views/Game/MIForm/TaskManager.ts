export type Task = (delta: number) => boolean

export class TaskManager {
  tasks: Task[] = []

  addTask(task: Task) {
    this.tasks.push(task)
  }

  removeTask(task: Task) {
    this.tasks = this.tasks.filter((_task) => _task !== task)
  }

  update(delta: number) {
    this.tasks = this.tasks.filter((task) => !task(delta)) // Remove finished tasks
  }

  addInterval(interval: number, task: Task): Task {
    let elapsed = 0
    const wrapped = (delta: number) => {
      elapsed += delta
      if (elapsed >= interval) {
        const lastElapsed = elapsed
        elapsed -= interval
        return task(lastElapsed)
      }
      return false
    }
    this.tasks.push(wrapped)
    return wrapped
  }

  // Add a setTimeout-like function
  setTimeout(delay: number, callback: (delta: number) => void): Task {
    let elapsed = 0
    const wrappedTask = (delta: number) => {
      elapsed += delta
      if (elapsed >= delay) {
        callback(elapsed) // Execute the callback when time is up
        return true // Remove the task after execution
      }
      return false // Keep the task until delay is met
    }
    this.tasks.push(wrappedTask)
    return wrappedTask
  }
}
