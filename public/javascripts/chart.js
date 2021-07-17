const ctx = document.getElementById('myChart')
const chart = document.getElementById('myCategory')
const budgetCtx = document.getElementById('myBudget')
const categoryAmount = document
  .getElementById('category-amount')
  .dataset.category.split(',')
const categoryName = document
  .getElementById('category-name')
  .dataset.category.split(',')
const budgetAmount = document
  .getElementById('budget-amount')
  .dataset.budget.split(',')
const month = document.getElementById('month').dataset.category.split(',')
const amountByMonth = document
  .getElementById('month-amount')
  .dataset.category.split(',')

const doughnutPieData = {
  datasets: [
    {
      data: categoryAmount,
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ]
    }
  ],

  // These labels appear in the legend and in the tooltips when hovering different arcs
  labels: categoryName
}

const budgetDoughnutPieData = {
  datasets: [
    {
      data: budgetAmount,
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ]
    }
  ],

  // These labels appear in the legend and in the tooltips when hovering different arcs
  labels: ['Spent', 'Remaining']
}

const doughnutPieOptions = {
  responsive: true,
  animation: {
    animateScale: true,
    animateRotate: true
  },
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        fontColor: 'rgb(255, 99, 132)',
        font: {
          size: 8
        }
      }
    }
  }
}

const budgetDoughnutPieOptions = {
  responsive: true,
  animation: {
    animateScale: true,
    animateRotate: true
  },
  plugins: {
    legend: {
      display: false
    }
  }
}

const myChart = new Chart(ctx, {
  type: 'doughnut',
  data: doughnutPieData,
  options: doughnutPieOptions
})

// Budget
const myBudgetChart = new Chart(budgetCtx, {
  type: 'doughnut',
  data: budgetDoughnutPieData,
  options: budgetDoughnutPieOptions
})

const chartData = {
  labels: month,
  datasets: [
    {
      label: 'Expense',
      data: amountByMonth,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true
        }
      }
    ]
  },
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 8
        }
      }
    }
  },
  elements: {
    point: {
      radius: 0
    }
  }
}

const amountChart = new Chart(chart, {
  type: 'bar',
  data: chartData,
  options: chartOptions
})
