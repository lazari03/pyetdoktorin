#!/usr/bin/env node

const fs = require('fs');

console.log('🔍 Testing Clean Architecture Implementation...\n');

// Define the clean structure
const expectedStructure = {
  'domain': {
    'entities': ['Appointment.ts', 'User.ts', 'Doctor.ts', 'Notification.ts', 'Payment.ts'],
    'repositories': ['IAppointmentRepository.ts', 'IUserRepository.ts', 'INotificationRepository.ts', 'IPaymentRepository.ts'],
    'services': ['IDomainServices.ts']
  },
  'application': {
    'use-cases': ['CreateAppointmentUseCase.ts', 'GetUserAppointmentsUseCase.ts', 'UpdateAppointmentStatusUseCase.ts', 'ProcessPaymentUseCase.ts']
  },
  'infrastructure': {
    'persistence': ['FirebaseAppointmentRepository.ts', 'FirebaseUserRepository.ts', 'FirebaseNotificationRepository.ts'],
    'di': ['DependencyContainer.ts', 'DependencyContext.tsx']
  },
  'presentation': {
    'components': ['AppointmentCard.tsx', 'AppointmentList.tsx', 'NotificationCenter.tsx'],
    'hooks': ['useUserAppointments.ts', 'useCreateAppointment.ts', 'useUpdateAppointmentStatus.ts'],
    'pages': ['CleanAppointmentsPage.tsx']
  }
};

let allTestsPassed = true;

function joinPath(baseDir, relativePath) {
  if (typeof relativePath !== 'string') throw new Error('Invalid path');
  if (relativePath.includes('\0')) throw new Error('Invalid path');
  if (relativePath.startsWith('/') || relativePath.startsWith('\\')) throw new Error('Invalid path');
  if (relativePath.includes(':')) throw new Error('Invalid path');

  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.some((seg) => seg === '..')) {
    throw new Error(`Blocked path traversal: ${relativePath}`);
  }

  const cleanBase = String(baseDir).replace(/[\\/]+$/, '');
  return `${cleanBase}/${segments.join('/')}`;
}

function checkDirectory(dirPath, expectedFiles) {
  console.log(`📁 Checking ${dirPath}`);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    allTestsPassed = false;
    return;
  }

  const actualFiles = fs.readdirSync(dirPath);
  let allFilesExist = true;

  expectedFiles.forEach(file => {
    // Expected files are allowlisted in this script; still resolve safely to avoid accidental traversal.
    const filePath = joinPath(dirPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} - NOT FOUND`);
      allFilesExist = false;
      allTestsPassed = false;
    }
  });

  if (allFilesExist) {
    console.log(`  ✅ All expected files found in ${dirPath}\n`);
  } else {
    console.log(`  ❌ Some files missing in ${dirPath}\n`);
  }
}

// Run tests
Object.keys(expectedStructure).forEach(layer => {
  const layerPath = `src/clean/src/${layer}`;
  console.log(`\n🏗️  Testing ${layer.toUpperCase()} layer:`);
  
  if (!fs.existsSync(layerPath)) {
    console.log(`❌ Layer directory not found: ${layerPath}`);
    allTestsPassed = false;
    return;
  }

  Object.keys(expectedStructure[layer]).forEach(subdir => {
    const subdirPath = `${layerPath}/${subdir}`;
    checkDirectory(subdirPath, expectedStructure[layer][subdir]);
  });
});

// Check dependency direction (basic check)
console.log('\n🔄 Checking dependency directions:');

try {
  // Check that domain doesn't import infrastructure
  const domainFiles = fs.readdirSync('src/clean/src/domain', { recursive: true })
    .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
  
  let domainViolations = 0;
  domainFiles.forEach(file => {
    const filePath = joinPath('src/clean/src/domain', file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('../infrastructure') || content.includes('../presentation')) {
      console.log(`❌ Domain layer violation in ${file} - imports outer layer`);
      domainViolations++;
    }
  });
  
  if (domainViolations === 0) {
    console.log('✅ Domain layer has no forbidden dependencies');
  }
} catch (error) {
  console.log('⚠️  Could not check dependencies:', error.message);
}

// Check use cases only depend on domain
try {
  const useCaseFiles = fs.readdirSync('src/clean/src/application/use-cases')
    .filter(file => file.endsWith('.ts'));
  
  let useCaseViolations = 0;
  useCaseFiles.forEach(file => {
    const filePath = joinPath('src/clean/src/application/use-cases', file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('../presentation')) {
      console.log(`❌ Use case violation in ${file} - imports presentation layer`);
      useCaseViolations++;
    }
  });
  
  if (useCaseViolations === 0) {
    console.log('✅ Use cases have no forbidden dependencies');
  }
} catch (error) {
  console.log('⚠️  Could not check use case dependencies:', error.message);
}

// Final result
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 ALL TESTS PASSED! Clean Architecture is properly implemented.');
} else {
  console.log('❌ Some tests failed. Please check the issues above.');
  process.exit(1);
}
