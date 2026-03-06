import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    color: '#1F2937',
  },
  // Header
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '2px solid #ff6b35',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  appNameSpent: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ff6b35',
  },
  appNameControl: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
  },
  appName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ff6b35',
  },
  reportTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerDate: {
    fontSize: 9,
    color: '#9CA3AF',
    marginTop: 2,
  },
  userName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
  },
  // Section
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1px solid #E5E7EB',
  },
  // Summary Cards
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    border: '1px solid #E5E7EB',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  summaryGreen: { color: '#10B981' },
  summaryRed: { color: '#EF4444' },
  summaryBlue: { color: '#ff6b35' },
  summaryPurple: { color: '#8B5CF6' },
  // Table
  table: {
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderTop: '1px solid #F3F4F6',
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  col1: { flex: 2 },
  col2: { flex: 1 },
  col3: { flex: 1, textAlign: 'right' },
  // Progress bar
  progressContainer: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  progressLabel: {
    fontSize: 9,
    color: '#374151',
    fontFamily: 'Helvetica-Bold',
  },
  progressPct: {
    fontSize: 9,
    color: '#6B7280',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
})

interface ReportData {
  userName: string
  month: string
  year: number
  income: number
  expenses: number
  savings: number
  transactions: { description: string; category: string; date: string; amount: number; type: string }[]
  budgets: { category: string; limit: number; spent: number }[]
  savingGoals: { name: string; targetAmount: number; savedAmount: number; targetDate: string }[]
  fixedPayments: { name: string; amount: number; isPaid: boolean }[]
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function FinancialReportPDF({ data }: { data: ReportData }) {
  const balance = data.income - data.expenses
  const savingsRate = data.income > 0 ? ((data.savings / data.income) * 100).toFixed(1) : '0'
  const totalFixedPaid = data.fixedPayments.filter((p) => p.isPaid).reduce((s, p) => s + p.amount, 0)
  const totalFixed = data.fixedPayments.reduce((s, p) => s + p.amount, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <View style={styles.logoRow}>
                <Text style={styles.appNameSpent}>Spent</Text>
                <Text style={styles.appNameControl}>Control</Text>
              </View>
              <Text style={styles.reportTitle}>Estado Financiero Mensual</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.userName}>{data.userName}</Text>
              <Text style={styles.headerDate}>{data.month} {data.year}</Text>
              <Text style={styles.headerDate}>Generado: {new Date().toLocaleDateString('es-ES')}</Text>
            </View>
          </View>
        </View>

        {/* RESUMEN GENERAL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Ingresos</Text>
              <Text style={[styles.summaryValue, styles.summaryGreen]}>{fmt(data.income)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Gastos</Text>
              <Text style={[styles.summaryValue, styles.summaryRed]}>{fmt(data.expenses)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Balance Neto</Text>
              <Text style={[styles.summaryValue, balance >= 0 ? styles.summaryBlue : styles.summaryRed]}>{fmt(balance)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Tasa de Ahorro</Text>
              <Text style={[styles.summaryValue, styles.summaryPurple]}>{savingsRate}%</Text>
            </View>
          </View>
        </View>

        {/* TRANSACCIONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transacciones del Mes ({data.transactions.length})</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Descripcion</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Categoria</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Fecha</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Monto</Text>
            </View>
            {data.transactions.slice(0, 15).map((tx, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, styles.col1]}>{tx.description}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{tx.category}</Text>
                <Text style={[styles.tableCell, styles.col2]}>{tx.date}</Text>
                <Text style={[styles.tableCell, styles.col3, { color: tx.type === 'INCOME' ? '#10B981' : '#EF4444' }]}>
                  {tx.type === 'INCOME' ? '+' : '-'}{fmt(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* PRESUPUESTO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Presupuesto por Categoria</Text>
          {data.budgets.map((b, i) => {
            const pct = Math.min((b.spent / b.limit) * 100, 100)
            const color = pct > 90 ? '#EF4444' : pct > 75 ? '#F59E0B' : '#10B981'
            return (
              <View key={i} style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{b.category} — {fmt(b.spent)} / {fmt(b.limit)}</Text>
                  <Text style={styles.progressPct}>{Math.round(pct)}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </View>
            )
          })}
        </View>

        {/* PAGOS FIJOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagos Fijos — {fmt(totalFixedPaid)} pagados de {fmt(totalFixed)}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Pago</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Monto</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Estado</Text>
            </View>
            {data.fixedPayments.map((p, i) => (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={[styles.tableCell, styles.col1]}>{p.name}</Text>
                <Text style={[styles.tableCell, styles.col3]}>{fmt(p.amount)}</Text>
                <Text style={[styles.tableCell, styles.col2, { color: p.isPaid ? '#10B981' : '#F59E0B' }]}>
                  {p.isPaid ? 'Pagado' : 'Pendiente'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* METAS DE AHORRO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progreso de Metas de Ahorro</Text>
          {data.savingGoals.map((g, i) => {
            const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100)
            return (
              <View key={i} style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>{g.name} — {fmt(g.savedAmount)} / {fmt(g.targetAmount)}</Text>
                  <Text style={styles.progressPct}>{Math.round(pct)}% · Meta: {g.targetDate}</Text>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: '#ff6b35' }]} />
                </View>
              </View>
            )
          })}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>SpentControl - Estado Financiero {data.month} {data.year}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
